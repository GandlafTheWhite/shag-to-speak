interface YinYangButtonProps {
  onClick: () => void;
}

const YinYangButton = ({ onClick }: YinYangButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 mx-auto cursor-pointer group transition-transform hover:scale-110 active:scale-95"
      aria-label="Начать использовать ShagToSpeak"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-slow"></div>
      
      <svg
        viewBox="0 0 200 200"
        className="relative z-10 w-full h-full animate-spin-slow drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="98" fill="white" stroke="currentColor" strokeWidth="2" className="text-border" />
        
        <path
          d="M 100 10 A 90 90 0 0 1 100 190 A 45 45 0 0 1 100 100 A 45 45 0 0 0 100 10 Z"
          fill="black"
        />
        
        <circle cx="100" cy="55" r="12" fill="white" />
        <circle cx="100" cy="145" r="12" fill="black" />
      </svg>
      
      <div className="absolute inset-0 rounded-full border-4 border-primary/30 group-hover:border-primary/60 transition-colors animate-pulse-glow"></div>
    </button>
  );
};

export default YinYangButton;
