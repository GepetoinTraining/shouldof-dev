import Providers from '@/components/Providers';

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
    return <Providers>{children}</Providers>;
}
