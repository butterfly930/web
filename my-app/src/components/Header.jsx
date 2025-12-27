function Header() {
return(
    <header className="w-full bg-blue shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-center ">
            <nav className="hidden md:flex space-x-6 gap-8" style={{position: "relative", alignItems: "center"}}>
                <a href="#" className="text-white"style={{marginInline:"20px"}}>Home</a>
                <a href="#"style={{marginInline:"20px"}}>Products</a>
                <a href="#"style={{marginInline:"20px"}}>About</a>
                <a href="#"style={{marginInline:"20px"}}>Contact</a>

                
                
                    <button style={{marginLeft:"25%", position:"relative"}}>Login</button>
                    <button style={{marginInline:"20px", position: "relative"}}>Sign Up</button>
                </nav>
            </div>
    </header>
)
}
export default Header;