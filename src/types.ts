export interface ProviderConfig {
  type: string;
  api_key?: string;
  base_url?: string;
  [key: string]: unknown;
}

export interface LogicalModelConfig {
  strategy: 'priority';
  candidates: string[];
}

export interface EnvironmentConfig {
  providers: Record<string, ProviderConfig>;
  models: Record<string, LogicalModelConfig>;
}

export interface LogicalModelResolution {
  logical_model: string;
  strategy: 'priority';
  candidates: string[];
}

export interface ProviderTarget {
  provider: string;
  model: string;
  provider_type: string;
  base_url?: string;
  credentials_ref?: string;
}

export interface ResolveRequest {
  model: string;
  require?: string[];
  env?: string;
}

export interface ResolveResult {
  provider: string;
  model: string;
  base_url?: string;
  credentials_ref?: string;
  logical_model?: string;
  env: string;
  metadata?: Record<string, unknown>;
}

export interface ModelConfig {
  version: number;
  environments: Record<string, EnvironmentConfig>;
  aliases?: Record<string, string>;
  capabilities?: {
    sources?: string[];
    overrides?: Record<string, string[]>;
  };
}
