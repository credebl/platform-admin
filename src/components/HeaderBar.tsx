import Image from "next/image";

const HeaderBar = () => {
  const logo = process.env.NEXT_PUBLIC_LOGO;

  if (!logo) {
    console.error("logo is not defined");
    return null;
  }  
  
  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-3 py-3 lg:px-5 lg:pl-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start">
          <a className="flex ml-2 md:mr-24" href="/">
            <Image
              src={logo}
              alt="logo"
              width={150}
              height={40}
              priority
            />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default HeaderBar;
