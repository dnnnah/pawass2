"""Run only against an isolated migrated DB. Uses real, concurrent connections."""
import concurrent.futures
import os
import subprocess
import uuid

url = os.environ['PAWGRAM_TEST_DATABASE_URL']
owner, other, pet, asset, post = [str(uuid.uuid4()) for _ in range(5)]
def sql(query):
    result = subprocess.run(['psql', url, '-XAt', '-v', 'ON_ERROR_STOP=1', '-c', query], capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()
def as_user(user, query):
    return sql(f"begin; set local role authenticated; select set_config('request.jwt.claim.sub','{user}',true); {query}; commit;")
try:
    sql(f"""
    insert into auth.users(id) values('{owner}'),('{other}');
    insert into public.pets(id,owner_id,name,species,privacy_accepted_at) values('{pet}','{owner}','Prueba concurrente','gato',now());
    insert into public.pawgram_assets(id,pet_id,owner_id,path) values('{asset}','{pet}','{owner}','{asset}.webp');
    """)
    as_user(owner, f"select public.pawgram_save_profile('{pet}','{{\"name\":\"Prueba concurrente\",\"species\":\"gato\"}}',true,null); select public.pawgram_create_post('{post}','{pet}','{asset}','','Gato de prueba')")
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        list(pool.map(lambda _: as_user(other, f"select public.pawgram_set_paw('{post}',true)"), range(24)))
    assert sql(f"select count(*) from public.pawgram_paws where post_id='{post}'") == '1'
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        list(pool.map(lambda _: as_user(other, f"select public.pawgram_set_paw('{post}',false)"), range(24)))
    assert sql(f"select count(*) from public.pawgram_paws where post_id='{post}'") == '0'
    # Withdrawal races with multiple new paws. Whatever wins the lock first,
    # no new paw may commit once the withdrawal has completed.
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        futures = [pool.submit(as_user, other, f"select public.pawgram_set_paw('{post}',true)") for _ in range(12)]
        as_user(owner, f"select public.pawgram_set_published('{pet}',false)")
        for future in futures:
            try: future.result()
            except RuntimeError as error:
                assert 'insufficient_privilege' in str(error) or 'insufficient privilege' in str(error)
    try:
        as_user(other, f"select public.pawgram_set_paw('{post}',true)")
    except RuntimeError:
        pass
    else:
        raise AssertionError('Hidden post accepted a new paw')
    print('PASS: concurrent give/remove, unique paw and withdrawal serialization')
finally:
    sql(f"delete from auth.users where id in ('{owner}','{other}'); delete from public.pawgram_assets where pet_id='{pet}';")
