interface HeaderProps {
    title: string;
    subtitle:string;
};

export const Header = ({
    title, subtitle
}: HeaderProps) => {
    return (
        <div className="w-full flex flex-col items-center justify-center">
            <h1 className="text-3xl font-semibold">
                <img className="h-10 w-10" src="/image/topicon.jpg" />
            </h1>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--cardheadtext)] to-[var(--cardheadtex)] bg-clip-text text-transparent">
                {title}
            </h1>

            <p className="text-muted-foreground text-[12px]">
                {subtitle}
            </p>
        </div>
    )
}