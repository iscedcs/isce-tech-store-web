interface HeaderProps {
    title: string;
    subtitle:string;
};

export const Header = ({
    title, subtitle
}: HeaderProps) => {
    return (
        <div className="w-ful flex flex-col gap-y-4 items-center justify-center">
            <h1 className="text-3xl font-semibold">
                <img className="h-10 w-10" src="/image/topicon.jpg" />
            </h1>
            <h1 className="text-4xl font-bold text-blue-600">
                {title}
            </h1>

            <p className="text-muted-foreground text-sm">
                {subtitle}
            </p>
        </div>
    )
}