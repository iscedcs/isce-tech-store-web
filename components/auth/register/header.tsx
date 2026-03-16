import Image from "next/image";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="w-10 h-10 flex  items-center justify-center bg-accent-blue rounded-lg">
        <Image
          src="/assets/isce_logo_standalone_black.png"
          width={100}
          height={100}
          alt="Logo"
          className="w-5 h-5 object-contain"
        />
      </div>

      <h1 className="text-2xl font-semibold text-accent-blue">{title}</h1>

      <p className="text-sm text-secondary-gray max-w-xs">{subtitle}</p>
    </div>
  );
};
