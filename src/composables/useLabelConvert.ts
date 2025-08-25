import {
  PH_MEASURE_BOUND,
  ORP_MEASURE_BOUND,
  NH3N_MEASURE_BOUND,
  FLORIDE_MEASURE_BOUND,
  // measure list
  ORP_MEASURE_LISTS,
  PH_MEASURE_LISTS,
  NH3N_MEASURE_LISTS,
  FLORIDE_MEASURE_LISTS,
} from '@/constants/measure';
import { ObservationType } from '@/types/device';

export interface UnitBound {
  low: number;
  high: number;
}

export interface MeasureList {
  label: string;
}

export function useLabelConvert() {
  const getUnitBound = (mainLabel: ObservationType): UnitBound => {
    switch (mainLabel) {
      case ObservationType.PH:
        return PH_MEASURE_BOUND;
      case ObservationType.ORP:
        return ORP_MEASURE_BOUND;
      case ObservationType.NH3N:
        return NH3N_MEASURE_BOUND;
      case ObservationType.FLOURIDE:
        return FLORIDE_MEASURE_BOUND;
      default:
        return ORP_MEASURE_BOUND;
    }
  };

  const getMeasureList = (mainLabel: ObservationType): MeasureList[] => {
    switch (mainLabel) {
      case ObservationType.PH:
        return PH_MEASURE_LISTS;
      case ObservationType.ORP:
        return ORP_MEASURE_LISTS;
      case ObservationType.NH3N:
        return NH3N_MEASURE_LISTS;
      case ObservationType.FLOURIDE:
        return FLORIDE_MEASURE_LISTS;
      default:
        return ORP_MEASURE_LISTS;
    }
  };

  const getMainMeasureUnit = (mainLabel: ObservationType): string => {
    switch (mainLabel) {
      case ObservationType.PH:
        return 'pH';
      case ObservationType.ORP:
        return 'mV';
      case ObservationType.NH3N:
        return 'ppm';
      case ObservationType.FLOURIDE:
        return 'ppm';
      default:
        return 'mV';
    }
  };

  return {
    getUnitBound,
    getMeasureList,
    getMainMeasureUnit,
  };
}
