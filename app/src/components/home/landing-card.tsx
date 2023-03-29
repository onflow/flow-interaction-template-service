import { Button } from "../shared/button-v2";
import OnFlowIcon from "../../../public/assets/flow-icon-bw-green.svg";

export function LandingCard({}: {}) {
  const classes =
    "flex flex-col items-start items-center px-4 py-6 md:flex-row md:px-15 md:py-12";
  return (
    <div className="bg-gradient-home-br">
      <div className="container">
        <div className={classes}>
          <div className="flex flex-1 flex-col items-start md:mr-10">
            <span className="mr-2 rounded px-1 py-1 font-display font-bold text-m text-gray-500">
              #onFlow
            </span>
            <header className="text-5xl font-display font-bold my-2 md:mb-3">
              Explore available transactions and scripts on Flow
            </header>
            <p className="md:max-w-sm overflow-hidden text-ellipsis font-semibold text-gray-600 mb-2">
              Build your application using prebuilt transactions and scripts for
              various Flow projects.
            </p>
            <Button
              onClick={() => {}}
              bgColor="bg-black"
              textColor="text-white"
              hoverColor="hover:bg-black/50"
            >
              Explore
            </Button>
          </div>
          <div className="flex w-full flex-1 flex-col items-stretch sm:mt-10 md:mt-0">
            <img src={OnFlowIcon.src} referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    </div>
  );
}
