const config = {
// Turned off for production because we do not need swagger in production bundle.
// Additionally, in bundle it tries to access some static resources which we would
// ideally need to copy. Another option could be to externalize swagger but that 
// would need us to put node_modules in distribution we don't want.
// for development, turn `true`
  ENABLE_SWAGGER: false,
};

export default config;