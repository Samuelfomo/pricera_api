export default class G {
  static tokenIsRequired = { code: 'token_is_required', message: 'Token is required' };
  static authenticationFailed = { code: 'authentication_failed', message: 'Authentication failed' };
  static UUIDGeneratorFailed = { code: 'UUID_generator_failed', message: 'UUID generator failed' };
  static requestBodyRequired = {
    code: 'body_request_required',
    message: 'The body of you requested is required',
  };
  static missingRequired = { code: 'missing_required_fields', message: 'entry is required' };
  static unauthorizedAccess = { code: 'access_unauthorized', message: 'access unauthorized' };
}
