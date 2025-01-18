const BigSpinner = () => {
  return (
    <div
      style={{
        clipPath:
          "path('m23.5 0C10.5415 0 0 10.5415 0 23.5v60C0 96.4585 10.5415 107 23.5 107h60c12.9585 0 23.5-10.5415 23.5-23.5v-60C107 10.5415 96.4585 0 83.5 0zm0 7h60c9.2015 0 16.5 7.2985 16.5 16.5v60c0 9.2015-7.2985 16.5-16.5 16.5h-60C14.2985 100 7 92.7015 7 83.5v-60C7 14.2985 14.2985 7 23.5 7z')",
      }}
      className="flex h-[107px] w-[107px] items-center justify-center overflow-visible"
    >
      <div className="loader-spinner min-h-[125%] min-w-[125%]" />
    </div>
  );
};

export const SmallSpinner = () => {
  return (
    <div
      style={{
        clipPath:
          "path('m5.5 0C2.4789 0 0 2.4789 0 5.5v22C0 30.5211 2.4789 33 5.5 33h22c3.0211 0 5.5-2.4789 5.5-5.5v-22C33 2.4789 30.5211 0 27.5 0zm0 3h22C28.9109 3 30 4.0891 30 5.5v22c0 1.4109-1.0891 2.5-2.5 2.5h-22C4.0891 30 3 28.9109 3 27.5v-22C3 4.0891 4.0891 3 5.5 3z')",
      }}
      className="flex h-[33px] w-[33px] items-center justify-center overflow-visible"
    >
      <div className="loader-spinner-sm min-h-[130%] min-w-[130%]" />
    </div>
  );
};

export const FullPageLoader = () => {
  return (
    <div className="scroll fixed left-0 top-0 z-50 flex h-screen w-screen flex-row items-center justify-center bg-[#13131F]">
      <BigSpinner />
    </div>
  );
};

export const ComponentLoader = () => {
  return (
    <div className="flex !h-full !min-h-full w-full flex-row items-center justify-center">
      <SmallSpinner />
    </div>
  );
};
