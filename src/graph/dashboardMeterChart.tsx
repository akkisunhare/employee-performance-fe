import React from "react";

interface MeterChartPropsMini {
  targetValue: number;
  currentValue: number;
}

interface MeterChartPropsMax {
  targetValue: number;
  currentValue: number;
  width?: number;  // in pixels
  height?: number; // in pixels
}

const DashboardMeterChartMini: React.FC<MeterChartPropsMini> = ({ targetValue, currentValue }:any) => {
  let percentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
  if (isNaN(percentage)) {
    percentage = 0;
  }

  const boundedValue = Math.min(100, Math.max(0, percentage));
  const rotationDegree = (boundedValue / 100) * 180 - 90;

  const getBackgroundGradient = () => {
    return "linear-gradient(115.62deg, #FF3D3D 25%, #FFA800 45%, #3ADF3A 65%, #0068FF 85%)";
  };

  return (
    <div className="rounded-xl cursor-default flex flex-col items-center justify-center p-0.5">
      <div
        style={{
          backgroundImage: getBackgroundGradient(),
        }}
        className="relative w-[100px] h-[50px] rounded-t-full overflow-hidden flex justify-center items-end"
      >
        <div className="relative w-[90px] h-[45px] bg-[#111111] mt-3 rounded-t-full overflow-hidden flex justify-center items-end">
          <div
            style={{
              bottom: "1px",
              position: "absolute",
              width: "35px",
              height: "37px",
              background: "#F6AB7B",
              transformOrigin: "bottom center",
              clipPath: "polygon(50% 0%, 6% 100%, 92% 100%)",
              transform: `rotate(${rotationDegree}deg)`,
              transition: "transform 0.3s ease-out",
            }}
          ></div>
          <div
            className="bg-[#111111] rounded-full h-[56px] flex items-center justify-center w-[50px] pb-[1.5rem] text-[10px] font-[400]"
            style={{
              position: "absolute",
              bottom: "-30px",
              color: "white",
              boxShadow: "0 0 8px 3px rgba(128, 128, 128, 0.5)",
            }}
          >
            {boundedValue.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardMeterChartMax: React.FC<MeterChartPropsMax> = ({
  targetValue,
  currentValue,
  width = 100,  // default width
  height = 50,  // default height
}) => {
  const percentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
  const boundedValue = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage));
  const rotationDegree = (boundedValue / 100) * 180 - 90;

  const getBackgroundGradient = () => {
    return "linear-gradient(115.62deg, #FF3D3D 25%, #FFA800 45%, #3ADF3A 65%, #0068FF 85%)";
  };

  const pointerSize = width * 0.35;

  return (
    <div className="rounded-xl cursor-default flex flex-col items-center justify-center p-0.5">
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: getBackgroundGradient(),
        }}
        className="relative rounded-t-full overflow-hidden flex justify-center items-end"
      >
        <div
          style={{
            width: `${width * 0.9}px`,
            height: `${height * 0.9}px`,
            marginTop: `${height * 0.06}px`,
          }}
          className="relative bg-[#111111] rounded-t-full overflow-hidden flex justify-center items-end"
        >
          <div
            style={{
              bottom: "1px",
              position: "absolute",
              width: `${pointerSize}px`,
              height: `${pointerSize}px`,
              background: "#F6AB7B",
              transformOrigin: "bottom center",
              clipPath: "polygon(50% 0%, 6% 100%, 92% 100%)",
              transform: `rotate(${rotationDegree}deg)`,
              transition: "transform 0.3s ease-out",
            }}
          />
          <div
            className="bg-[#111111] rounded-full flex items-center justify-center text-[10px] font-[400] bottom-[-100px]"
            style={{
              position: "absolute",
            //   bottom: `-${height * 0.6}px`,
              width: `${width * 0.5}px`,
              height: `${height}px`,
              fontSize: `${Math.max(width * 0.1, 10)}px`,
              color: "white",
              boxShadow: "0 0 8px 3px rgba(128, 128, 128, 0.5)",
              paddingBottom: `${height * 0.3}px`,
            }}
          >
            {boundedValue.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};


export { DashboardMeterChartMax, DashboardMeterChartMini};
