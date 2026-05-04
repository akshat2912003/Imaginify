const Header = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="h2-bold text-dark-600">{title}</h2>
      {subtitle && <p className="p-16-regular mt-4 text-dark-400">{subtitle}</p>}
    </div>
  );
};

export default Header;
