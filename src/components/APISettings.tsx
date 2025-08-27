import { useState, useEffect } from 'react';
import { APIProvider, APISettings } from '../types';
import './APISettings.css';

interface APISettingsProps {
  onSettingsChange: (settings: APISettings) => void;
  currentSettings: APISettings;
  currentProvider: APIProvider;
  onProviderChange: (provider: APIProvider) => void;
}

const DEFAULT_MODELS = {
  openrouter: 'deepseek/deepseek-r1-0528:free',
  openai: 'gpt-4o'
};

export default function APISettingsComponent({ onSettingsChange, currentSettings, currentProvider, onProviderChange }: APISettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<APISettings>(currentSettings);
  const [activeProvider, setActiveProvider] = useState<APIProvider>('openrouter');

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleProviderChange = (provider: APIProvider) => {
    setActiveProvider(provider);
  };

  const handleProviderActivation = (provider: APIProvider) => {
    if (settings[provider].apiKey) {
      onProviderChange(provider);
    }
  };

  const handleApiKeyChange = (provider: APIProvider, apiKey: string) => {
    const updatedSettings = {
      ...settings,
      [provider]: {
        ...settings[provider],
        apiKey
      }
    };
    setSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  const handleModelChange = (provider: APIProvider, model: string) => {
    const updatedSettings = {
      ...settings,
      [provider]: {
        ...settings[provider],
        model
      }
    };
    setSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  const getProviderStatus = (provider: APIProvider) => {
    const hasKey = !!settings[provider].apiKey;
    const isActive = currentProvider === provider && hasKey;
    
    if (isActive) return 'active';
    if (hasKey) return 'configured';
    return 'not-configured';
  };

  return (
    <div className="api-settings">
      <button 
        className="settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="API Settings"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className="settings-modal">
          <div className="settings-content">
            <div className="settings-header">
              <h3>API Configuration</h3>
              <button 
                className="close-button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="provider-tabs">
              <button
                className={`provider-tab ${activeProvider === 'openrouter' ? 'active' : ''}`}
                onClick={() => handleProviderChange('openrouter')}
              >
                <div className="provider-tab-content">
                  <span>OpenRouter</span>
                  <div className="provider-status">
                    <span className={`status-indicator ${getProviderStatus('openrouter')}`}></span>
                    {getProviderStatus('openrouter') === 'active' && <span className="status-text">ACTIVE</span>}
                    {getProviderStatus('openrouter') === 'configured' && (
                      <button 
                        className="activate-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProviderActivation('openrouter');
                        }}
                      >
                        ACTIVATE
                      </button>
                    )}
                  </div>
                </div>
              </button>
              <button
                className={`provider-tab ${activeProvider === 'openai' ? 'active' : ''}`}
                onClick={() => handleProviderChange('openai')}
              >
                <div className="provider-tab-content">
                  <span>OpenAI</span>
                  <div className="provider-status">
                    <span className={`status-indicator ${getProviderStatus('openai')}`}></span>
                    {getProviderStatus('openai') === 'active' && <span className="status-text">ACTIVE</span>}
                    {getProviderStatus('openai') === 'configured' && (
                      <button 
                        className="activate-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProviderActivation('openai');
                        }}
                      >
                        ACTIVATE
                      </button>
                    )}
                  </div>
                </div>
              </button>
            </div>

            <div className="provider-config">
              {activeProvider === 'openrouter' && (
                <div>
                  <h4>OpenRouter</h4>
                  <p className="provider-description">
                    Access to multiple models via OpenRouter. 
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
                      Get your API key
                    </a>
                  </p>
                  
                  <div className="form-group">
                    <label htmlFor="openrouter-key">API Key:</label>
                    <input
                      id="openrouter-key"
                      type="password"
                      placeholder="sk-or-v1-..."
                      value={settings.openrouter.apiKey}
                      onChange={(e) => handleApiKeyChange('openrouter', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="openrouter-model">Model:</label>
                    <select
                      id="openrouter-model"
                      value={settings.openrouter.model}
                      onChange={(e) => handleModelChange('openrouter', e.target.value)}
                    >
                      <option value="deepseek/deepseek-r1-0528:free">DeepSeek R1 (Free)</option>
                      <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                      <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                      <option value="openai/gpt-4o">GPT-4o</option>
                    </select>
                  </div>
                </div>
              )}

              {activeProvider === 'openai' && (
                <div>
                  <h4>OpenAI</h4>
                  <p className="provider-description">
                    Direct access to OpenAI APIs. 
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                      Get your API key
                    </a>
                  </p>
                  
                  <div className="form-group">
                    <label htmlFor="openai-key">API Key:</label>
                    <input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      value={settings.openai.apiKey}
                      onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="openai-model">Model:</label>
                    <select
                      id="openai-model"
                      value={settings.openai.model}
                      onChange={(e) => handleModelChange('openai', e.target.value)}
                    >
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="settings-footer">
              <p className="note">
                API keys are stored only locally in your browser and are never sent to external servers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}