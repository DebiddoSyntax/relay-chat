import { useDarkMode } from '@/src/functions/global/DarkModeContext';
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { FiMonitor } from "react-icons/fi";


function Theme() {

    const { isDarkMode, setTheme, theme } = useDarkMode()
    
    return (
        <div className='2xl:flex py-2 px-3 bg-gray-bg gap-2 items-center text-xs rounded-lg w-full'>
            <div className={`${theme === 'light' ? 'bg-background' : isDarkMode ? 'hover:text-foreground hover:bg-gray-hover/10 text-gray-500' : 'hover:text-foreground hover:bg-gray-hover'} flex items-center gap-2 py-3 pl-2 pr-3  cursor-pointer rounded-md`} onClick={()=> setTheme('light')}>
                <MdLightMode /> 
                <p>light</p>
            </div>
            <div className={`${theme === 'dark' ? 'bg-background' : isDarkMode ? 'hover:text-foreground hover:bg-gray-hover/10 text-gray-500' : 'hover:text-foreground hover:bg-gray-hover'} mt-2 2xl:mt-0 flex items-center gap-2 py-3 pl-2 pr-3  cursor-pointer rounded-md`} onClick={()=> setTheme('dark')}>
                <MdDarkMode /> 
                <p>dark</p>
            </div>
            <div className={`${theme === 'system' ? 'bg-background' : isDarkMode ? 'hover:text-foreground hover:bg-gray-hover/10 text-gray-500' : 'hover:text-foreground hover:bg-gray-hover'} mt-2 2xl:mt-0 flex items-center gap-2 py-3 pl-2 pr-3  cursor-pointer rounded-md`} onClick={()=> setTheme('system')}>
                <FiMonitor />
                <p>system</p>
            </div>
        </div>
    )
}

export default Theme
