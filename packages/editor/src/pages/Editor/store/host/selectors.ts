import { IState } from "../reducer";
import { createSelector } from "reselect";
import { Utilities, HostType, PlatformType } from "common/build/helpers/officeJsHost";
import { isPoppedOut } from "common/build/utilities/popout.control";

const getHostsMatch = (state: IState): boolean => state.host === Utilities.host;

export const get = (state: IState): string => state.host;
export const getIsWeb = (_?: IState): boolean => Utilities.host === HostType.WEB;
export const getIsInDesktop = (_?: IState) => Utilities.platform === PlatformType.PC;
export const getIsRunnableOnThisHost = createSelector(
  [get, getHostsMatch],
  (host, hostsMatch) => host !== HostType.OUTLOOK && hostsMatch && !isPoppedOut(),
);
