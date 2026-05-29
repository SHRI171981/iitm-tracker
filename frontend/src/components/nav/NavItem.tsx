interface Props {
  Name: string;
}

const NavItem = ({ Name }: Props) => {
  return (
    <div className="h-12 w-24 text-center content-center ml-1 mr-1 text-slate-950 font-bold hover:bg-gray-300">
      {Name}
    </div>
  );
};

export default NavItem;