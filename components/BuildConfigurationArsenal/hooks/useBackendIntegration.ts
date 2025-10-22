// components/BuildConfigurationArsenal/hooks/useBackendIntegration.ts
import { useCallback, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface BuildConfiguration {
  id?: string;
  name: string;
  description?: string;
  config_json: any;
  preset_type: string;
  user_id?: string;
  team_id?: string;
  is_public?: boolean;
  is_template?: boolean;
}

export interface BuildHistory {
  id: string;
  config_id: string;
  config_name?: string;
  build_name: string;
  status: 'success' | 'failed' | 'building' | 'cancelled';
  input_files?: any;
  output_files?: any;
  performance_metrics?: any;
  logs?: any[];
  duration_ms?: number;
  bundle_size_kb?: number;
  s3_artifact_path?: string;
  nu_fire_storage_id?: string;
  created_at: string;
}

export interface BuildAnalytics {
  total_configurations: number;
  total_builds: number;
  success_rate: string;
  average_duration_ms: number;
  average_bundle_size_kb: number;
}

export function useBackendIntegration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration management
  const saveConfiguration = useCallback(async (
    config: any,
    metadata: {
      name: string;
      description?: string;
      presetType?: string;
      userId?: string;
      teamId?: string;
      isPublic?: boolean;
      isTemplate?: boolean;
    }
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/configurations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: metadata.name,
          description: metadata.description,
          config_json: config,
          preset_type: metadata.presetType || 'custom',
          user_id: metadata.userId,
          team_id: metadata.teamId,
          is_public: metadata.isPublic || false,
          is_template: metadata.isTemplate || false,
        }),
      });

      if (!response.ok) throw new Error('Failed to save configuration');

      const result = await response.json();
      return result.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConfigurations = useCallback(async (
    userId?: string,
    teamId?: string
  ): Promise<BuildConfiguration[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      if (teamId) params.append('team_id', teamId);

      const response = await fetch(`${API_BASE_URL}/api/configurations?${params}`);

      if (!response.ok) throw new Error('Failed to load configurations');

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getConfiguration = useCallback(async (id: string): Promise<BuildConfiguration> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/configurations/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Configuration not found');
        }
        throw new Error('Failed to load configuration');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfiguration = useCallback(async (
    id: string,
    updates: Partial<BuildConfiguration>
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/configurations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Configuration not found');
        }
        throw new Error('Failed to update configuration');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConfiguration = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/configurations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Configuration not found');
        }
        throw new Error('Failed to delete configuration');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Build execution
  const executeBuild = useCallback(async (
    configId: string,
    buildData: {
      build_name?: string;
      input_files?: any;
      user_id?: string;
    } = {}
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/builds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_id: configId,
          ...buildData,
        }),
      });

      if (!response.ok) throw new Error('Failed to execute build');

      const result = await response.json();
      return result.build_id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Build history
  const getBuildHistory = useCallback(async (
    configId?: string,
    userId?: string,
    limit: number = 50
  ): Promise<BuildHistory[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (configId) params.append('config_id', configId);
      if (userId) params.append('user_id', userId);
      if (limit !== 50) params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/builds?${params}`);

      if (!response.ok) throw new Error('Failed to load build history');

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBuildDetails = useCallback(async (buildId: string): Promise<BuildHistory> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/builds/${buildId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Build not found');
        }
        throw new Error('Failed to load build details');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Analytics
  const getAnalytics = useCallback(async (
    userId?: string,
    teamId?: string
  ): Promise<BuildAnalytics> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      if (teamId) params.append('team_id', teamId);

      const response = await fetch(`${API_BASE_URL}/api/analytics?${params}`);

      if (!response.ok) throw new Error('Failed to load analytics');

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Presets
  const getPresets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/presets`);

      if (!response.ok) throw new Error('Failed to load presets');

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    // Configuration methods
    saveConfiguration,
    loadConfigurations,
    getConfiguration,
    updateConfiguration,
    deleteConfiguration,
    // Build methods
    executeBuild,
    getBuildHistory,
    getBuildDetails,
    // Analytics
    getAnalytics,
    // Presets
    getPresets,
  };
}
