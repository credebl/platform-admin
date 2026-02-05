
const FooterBar = () => {
    const platformName = process.env.NEXT_PUBLIC_PLATFORM_NAME;

    if (!platformName) {
        console.error("platformName is not defined");
        return null;
    } 

    return (
        <footer className="bg-custom-100 dark:bg-gray-800">
            <div className="md:flex md:items-center md:justify-between p-3">
                <p className="text-sm text-center text-gray-500">
                    &copy; 2019 - {new Date().getFullYear()}
                    &nbsp; <a className="hover:underline" target="_blank"
                    > {platformName}
                    </a> | All rights reserved.
                </p>
            </div>
        </footer>
    )
}

export default FooterBar;
