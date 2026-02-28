interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg">
        <img
          src="/image/topicon.jpg"
          alt="Logo"
          className="w-5 h-5 object-contain"
        />
      </div>

      <h1 className="text-2xl font-semibold text-blue-600">
        {title}
      </h1>

      <p className="text-sm text-gray-500 max-w-xs">
        {subtitle}
      </p>
    </div>
  );
};