import { IEmptyListMessage } from "@/utils/common.interfaces";

export const EmptyListMessage = ({
    message,
    description,
    buttonContent,
    svgComponent,
    onClick,
    feature,
    noExtraHeight,
  }: IEmptyListMessage) => {
    return (
      <div
        className={`flex ${
          noExtraHeight ? "" : "mt-20 mb-16"
        } justify-start items-center flex-col`}
      >
        <p className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {message}
        </p>
        <p className="text-md mb-4 text-gray-900 dark:text-white">
          {description}
        </p>
      </div>
    );
  };
  