import { DemoLandingPage } from '@/features/demo/views';
import { demoPets } from '@/features/demo/domain';

export default function DemoPage() {
  return <DemoLandingPage pets={demoPets} />;
}
