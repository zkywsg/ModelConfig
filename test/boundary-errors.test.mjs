import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadConfig } from '../dist/config/index.js';
import { getEnvConfig } from '../dist/config/index.js';
import { ModelConfigError } from '../dist/errors/index.js';
import { resolveAlias } from '../dist/model/index.js';
import { resolveProviderTarget } from '../dist/provider/index.js';
import { resolve } from '../dist/resolver/index.js';

function createTempConfigFile(content) {
  const dir = mkdtempSync(join(tmpdir(), 'modelconfig-test-'));
  const filePath = join(dir, 'modelconfig.json');
  writeFileSync(filePath, content, 'utf8');

  return {
    filePath,
    cleanup() {
      rmSync(dir, { recursive: true, force: true });
    }
  };
}

function createBaseConfig() {
  return {
    version: 1,
    environments: {
      dev: {
        providers: {
          openai: {
            type: 'openai',
            api_key: 'env:OPENAI_API_KEY'
          }
        },
        models: {
          smart: {
            strategy: 'priority',
            candidates: ['openai:gpt-4o']
          }
        }
      }
    },
    aliases: {
      'gpt-4o-latest': 'openai:gpt-4o'
    },
    capabilities: {
      overrides: {
        'openai:gpt-4o': ['vision', 'json_output']
      }
    }
  };
}

test('loadConfig returns CONFIG_INVALID when environment variable is missing', () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  const fixture = createTempConfigFile(
    JSON.stringify({
      version: 1,
      environments: {
        dev: {
          providers: {
            openai: {
              type: 'openai',
              api_key: '${OPENAI_API_KEY}'
            }
          },
          models: {
            smart: {
              strategy: 'priority',
              candidates: ['openai:gpt-4o']
            }
          }
        }
      }
    })
  );

  try {
    assert.throws(
      () => loadConfig(fixture.filePath),
      (error) => {
        assert.ok(error instanceof ModelConfigError);
        assert.equal(error.type, 'CONFIG_INVALID');
        assert.equal(error.details?.env, 'OPENAI_API_KEY');
        assert.equal(error.details?.field, '$.environments.dev.providers.openai.api_key');
        return true;
      }
    );
  } finally {
    fixture.cleanup();
    if (previous !== undefined) {
      process.env.OPENAI_API_KEY = previous;
    }
  }
});

test('getEnvConfig returns ENV_NOT_FOUND for unknown environment', () => {
  const config = createBaseConfig();

  assert.throws(
    () => getEnvConfig(config, 'prod'),
    (error) => {
      assert.ok(error instanceof ModelConfigError);
      assert.equal(error.type, 'ENV_NOT_FOUND');
      assert.deepEqual(error.details?.available, ['dev']);
      return true;
    }
  );
});

test('resolveAlias returns ALIAS_NOT_FOUND for alias cycles', () => {
  assert.throws(
    () =>
      resolveAlias('smart-latest', {
        'smart-latest': 'gpt-4o-latest',
        'gpt-4o-latest': 'smart-latest'
      }),
    (error) => {
      assert.ok(error instanceof ModelConfigError);
      assert.equal(error.type, 'ALIAS_NOT_FOUND');
      return true;
    }
  );
});

test('resolveProviderTarget returns PROVIDER_NOT_CONFIGURED for missing provider', () => {
  const config = createBaseConfig();

  assert.throws(
    () => resolveProviderTarget(config.environments.dev, 'anthropic:claude-sonnet'),
    (error) => {
      assert.ok(error instanceof ModelConfigError);
      assert.equal(error.type, 'PROVIDER_NOT_CONFIGURED');
      assert.deepEqual(error.details?.available_providers, ['openai']);
      return true;
    }
  );
});

test('resolve returns CAPABILITY_MISMATCH with rejected candidates detail', () => {
  const config = createBaseConfig();

  assert.throws(
    () =>
      resolve(config, {
        model: 'smart',
        require: ['tools'],
        env: 'dev'
      }),
    (error) => {
      assert.ok(error instanceof ModelConfigError);
      assert.equal(error.type, 'CAPABILITY_MISMATCH');
      assert.equal(error.details?.logical_model, 'smart');
      assert.deepEqual(error.details?.required, ['tools']);
      assert.deepEqual(error.details?.rejected, [
        {
          candidate: 'openai:gpt-4o',
          missing: ['tools']
        }
      ]);
      return true;
    }
  );
});

test('ModelConfigError.toJSON returns the stable error contract', () => {
  const error = ModelConfigError.capabilityMismatch('No models support the required capabilities.', {
    logical_model: 'smart',
    env: 'dev'
  });

  assert.deepEqual(error.toJSON(), {
    type: 'CAPABILITY_MISMATCH',
    message: 'No models support the required capabilities.',
    retryable: false,
    details: {
      logical_model: 'smart',
      env: 'dev'
    }
  });
});
