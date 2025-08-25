import { ObservationType } from '@/types/device';

export function observationTag(name: ObservationType) {
  switch (name) {
    case ObservationType.PH:
      return 'pH';
    case ObservationType.NH3N:
      return 'NH3';
    case ObservationType.ORP:
      return 'ORP';
    case ObservationType.FLOURIDE:
      return 'F-';
    default:
      return name;
  }
}

export function fullObservationTag(name: ObservationType) {
  switch (name) {
    case ObservationType.PH:
      return 'pH';
    case ObservationType.NH3N:
      return 'NH3-N';
    case ObservationType.ORP:
      return 'ORP';
    case ObservationType.FLOURIDE:
      return 'F-';
    default:
      return name;
  }
}
