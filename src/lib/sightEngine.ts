import fetch from 'node-fetch';
import config from '../config';

const models = [
  'offensive',
];

const API_BASE = `https://api.sightengine.com/1.0`;
const API_ENDPOINT_IMAGE = `/check.json`;

interface SightEngineNudityResponse {
  raw: number
  safe: number
  partial: number
}

interface SightEngineOffensiveResponse {
  prob: number
}

export interface SightEngineResponse {
  status: string
  nudity: SightEngineNudityResponse
  offensive: SightEngineOffensiveResponse
}

async function doRequest(endpoint: string, params: Record<string, string>): Promise<SightEngineResponse> {
  const finalParams: Record<string, string> = {
    api_user: config.sightEngine.user,
    api_secret: config.sightEngine.secret,
    models: models.join(','),
    ...params,
  };
  const qs = Object.keys(finalParams)
    .map((key) => `${key}=${encodeURIComponent(finalParams[key])}`).join('&');

  const url = `${API_BASE}${endpoint}?${qs}`;

  const result = await fetch(url);
  return <Promise<SightEngineResponse>>result.json();
}

export async function checkImage(url: string): Promise<SightEngineResponse> {
  return doRequest(API_ENDPOINT_IMAGE, { url });
}
