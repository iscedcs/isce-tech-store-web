import Image from "next/image";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold">
        <Image
          width={100}
          alt={title}
          height={100}
          className="h-10 w-10"
          src="/assets/isce_logo_standalone_black.png"
        />
      </h1>
      <h1 className="text-3xl font-bold bg-linear-to-r from-(--cardheadtext) to-(--cardheadtex) bg-clip-text text-transparent">
        {title}
      </h1>

      <p className="text-muted-foreground text-[12px]">{subtitle}</p>
    </div>
  );
};
