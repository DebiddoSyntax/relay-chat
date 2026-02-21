let navigate: ((path: string) => void) | null = null;

export const useNavigation = (fn: (path: string) => void) => {
    navigate = fn;
};

export const redirect = (path: string) => {
    if (navigate) {
        navigate(path);
    }
};