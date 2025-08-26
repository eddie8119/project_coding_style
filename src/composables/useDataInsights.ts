import type { CaliData } from '@/types/calibration';
import type { StatisticsData } from '@/types/datainsight';
import type { Device } from '@/types/device';
import type { Measure } from '@/types/measure';
import type { GaugeProps } from '@/types/record';

import { datainsightsApi } from '@/api/datainsights';
import { cleanID } from '@/utils/common';

export function useDataInsights() {
  /**
   * Map latest measures by device ID
   * @param latestMeasures - Array of latest measures
   * @returns Object with device IDs as keys and measures as values
   */
  const mapLatestMeasuresByDevice = (latestMeasures: Measure[]) => {
    return latestMeasures.reduce(
      (acc, device) => {
        const deviceID = cleanID(device.ID);
        acc[deviceID] = device;
        return acc;
      },
      {} as Record<string, Measure>
    );
  };

  /**
   * Generate gauge props by combining device details with their latest measurements
   * @param devices - Array of device data
   * @param latestMeasureResponse - Latest measure response data
   * @returns Array of gauge props
   */
  const generateGaugeProps = (
    devices: Device[],
    latestMeasureResponse: Measure[]
  ): GaugeProps[] => {
    // Map latest measures by device ID for easy lookup
    const latestMeasureByDevice = mapLatestMeasuresByDevice(latestMeasureResponse);

    // Generate gauge props by combining device details with latest measurements
    return devices
      .filter((device) => latestMeasureByDevice[device.ID]) // Filter out devices with no latest measure
      .map((device: Device) => ({
        ...device,
        ...latestMeasureByDevice[device.ID],
        active: device.status === 'running',
      }));
  };

  /**
   * Fetch latest measure data for devices
   * @param ids - Comma-separated list of device IDs
   * @returns Array of latest measures
   */
  const fetchLatestMeasure = async (ids: string): Promise<Measure[]> => {
    if (!ids) return [];

    try {
      const response = await datainsightsApi.getLatestMeasure(ids);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching latest measures:', error);
      return [];
    }
  };

  /**
   * Fetch latest calibration data for devices
   * @param ids - Comma-separated list of device IDs
   * @returns Array of latest calibration data
   */
  const fetchLatestCalibration = async (ids: string): Promise<CaliData[]> => {
    if (!ids) return [];

    try {
      const response = await datainsightsApi.getLatestCalibration(ids);

      return response.data.data;
    } catch (error) {
      console.error('Error fetching latest calibration:', error);
      return [];
    }
  };

  /**
   * Fetch statistics data for devices
   * @param ids - Comma-separated list of device IDs
   * @returns Array of statistics data
   */
  const fetchStatistics = async (ids: string): Promise<StatisticsData[]> => {
    if (!ids) return [];

    try {
      const response = await datainsightsApi.getStatistics(ids);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return [];
    }
  };

  /**
   * Fetch measure history data for devices
   * @param ids - Comma-separated list of device IDs
   * @param yAxis - Y-axis unit for measurement
   * @returns Measure history data
   */
  const fetchMeasureHistory = async (
    ids: string,
    unit: string,
    start_time?: string | number,
    end_time?: string | number
  ) => {
    if (!ids || !unit) return null;

    try {
      const params = {
        ids,
        unit,
        start_time: start_time?.toString(),
        end_time: end_time?.toString(),
      };
      const response = await datainsightsApi.getMeasureHistory(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching measure history:', error);
      return null;
    }
  };

  /**
   * Fetch calibration history data for devices
   * @param ids - Comma-separated list of device IDs
   * @param yAxis - Y-axis unit for calibration
   * @returns Calibration history data
   */
  const fetchCalibrationHistory = async (
    ids: string,
    unit: string,
    start_time?: string,
    end_time?: string
  ) => {
    if (!ids || !unit) return null;

    try {
      const response = await datainsightsApi.getCalibrationHistory({
        ids,
        unit,
        start_time,
        end_time,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching calibration history:', error);
      return null;
    }
  };

  return {
    mapLatestMeasuresByDevice,
    generateGaugeProps,
    fetchLatestMeasure,
    fetchLatestCalibration,
    fetchStatistics,
    fetchMeasureHistory,
    fetchCalibrationHistory,
  };
}
