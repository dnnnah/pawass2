-- Cover moderation actor FKs for account deletion, and revoke Supabase's
-- inherited default EXECUTE grant from the anonymous role on this private check.
create index pawgram_profiles_moderated_by on public.pawgram_profiles(moderated_by);
create index pawgram_posts_moderated_by on public.pawgram_posts(moderated_by);
revoke all on function public.pawgram_is_admin() from anon;
revoke all on function pawgram_private.profile_projection(public.pawgram_profiles),pawgram_private.retire_asset(),pawgram_private.retire_pet_assets() from public,anon,authenticated;
