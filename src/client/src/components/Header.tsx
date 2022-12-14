import logo from '../images/icon.png';

const Header = () => {
  return (
    <div className="navbar bg-base-200">
      <div className="btn btn-ghost">
        <img src={logo} alt="logo" className="w-12" />
        <button className="normal-case text-xl px-2">CardGenerator</button>
      </div>
    </div>
  );
};

export default Header;
