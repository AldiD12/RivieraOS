/**
 * Feature Guard Components - Access Control UI
 * Conditionally renders content based on business feature flags
 */

import { useBusinessFeatures } from '../store/businessStore';

/**
 * FeatureGuard - Renders children only if feature is enabled
 * @param {string} feature - Feature name to check
 * @param {React.ReactNode} children - Content to render if feature is enabled
 * @param {React.ReactNode} fallback - Content to render if feature is disabled
 */
export function FeatureGuard({ feature, children, fallback = null }) {
  const { hasFeature } = useBusinessFeatures();
  
  if (hasFeature(feature)) {
    return children;
  }
  
  return fallback;
}

/**
 * MultiFeatureGuard - Renders children only if ALL features are enabled
 * @param {string[]} features - Array of feature names to check
 * @param {React.ReactNode} children - Content to render if all features are enabled
 * @param {React.ReactNode} fallback - Content to render if any feature is disabled
 */
export function MultiFeatureGuard({ features, children, fallback = null }) {
  const { hasAllFeatures } = useBusinessFeatures();
  
  if (hasAllFeatures(features)) {
    return children;
  }
  
  return fallback;
}

/**
 * AnyFeatureGuard - Renders children if ANY of the features are enabled
 * @param {string[]} features - Array of feature names to check
 * @param {React.ReactNode} children - Content to render if any feature is enabled
 * @param {React.ReactNode} fallback - Content to render if no features are enabled
 */
export function AnyFeatureGuard({ features, children, fallback = null }) {
  const { hasAnyFeature } = useBusinessFeatures();
  
  if (hasAnyFeature(features)) {
    return children;
  }
  
  return fallback;
}

/**
 * FeatureToggle - Renders different content based on feature state
 * @param {string} feature - Feature name to check
 * @param {React.ReactNode} enabled - Content to render if feature is enabled
 * @param {React.ReactNode} disabled - Content to render if feature is disabled
 */
export function FeatureToggle({ feature, enabled, disabled }) {
  const { hasFeature } = useBusinessFeatures();
  
  return hasFeature(feature) ? enabled : disabled;
}

/**
 * FeatureStatus - Shows visual indicator of feature status
 * @param {string} feature - Feature name to check
 * @param {string} label - Display label for the feature
 */
export function FeatureStatus({ feature, label }) {
  const { hasFeature } = useBusinessFeatures();
  const isEnabled = hasFeature(feature);
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        isEnabled ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className={`text-sm ${
        isEnabled ? 'text-green-600' : 'text-red-600'
      }`}>
        {label} {isEnabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
}

/**
 * UpgradePrompt - Shows upgrade message for disabled features
 * @param {string} feature - Feature name
 * @param {string} featureName - Human-readable feature name
 */
export function UpgradePrompt({ feature, featureName }) {
  const { hasFeature } = useBusinessFeatures();
  
  if (hasFeature(feature)) {
    return null;
  }
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
      <div className="text-amber-800 font-medium mb-2">
        🔒 {featureName} Not Available
      </div>
      <p className="text-amber-700 text-sm mb-3">
        This feature is not included in your current plan.
      </p>
      <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm">
        Contact Sales to Upgrade
      </button>
    </div>
  );
}