'use strict';

var _interopRequireDefault = require('@babel/runtime-corejs2/helpers/interopRequireDefault');

var _Object$defineProperty = require('@babel/runtime-corejs2/core-js/object/define-property');

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.possiblyAddScopeDirective = exports.possiblyAddDirectiveImplementations = exports.possiblyAddDirectiveDeclarations = exports.shouldAddAuthDirective = exports.checkRequestError = void 0;

var _typeof2 = _interopRequireDefault(
  require('@babel/runtime-corejs2/helpers/typeof')
);

var _graphql = require('graphql');

var _graphqlAuthDirectives = require('graphql-auth-directives');

var _utils = require('./utils');

// Initial support for checking auth

/*
 *  Check is context.req.error or context.error
 *  have been defined.
 */
var checkRequestError = function checkRequestError(context) {
  if (context && context.req && context.req.error) {
    return context.req.error;
  } else if (context && context.error) {
    return context.error;
  } else {
    return false;
  }
};

exports.checkRequestError = checkRequestError;

var shouldAddAuthDirective = function shouldAddAuthDirective(
  config,
  authDirective
) {
  if (config && (0, _typeof2['default'])(config) === 'object') {
    return (
      config.auth === true ||
      (config &&
        (0, _typeof2['default'])(config.auth) === 'object' &&
        config.auth[authDirective] === true)
    );
  }

  return false;
};

exports.shouldAddAuthDirective = shouldAddAuthDirective;

var possiblyAddDirectiveDeclarations = function possiblyAddDirectiveDeclarations(
  typeMap,
  config
) {
  if (shouldAddAuthDirective(config, 'isAuthenticated')) {
    typeMap['isAuthenticated'] = (0, _graphql.parse)(
      'directive @isAuthenticated on OBJECT | FIELD_DEFINITION'
    ).definitions[0];
  }

  if (shouldAddAuthDirective(config, 'hasRole')) {
    getRoleType(typeMap); // ensure Role enum is specified in typedefs

    typeMap['hasRole'] = (0, _graphql.parse)(
      'directive @hasRole(roles: [Role]) on OBJECT | FIELD_DEFINITION'
    ).definitions[0];
  }

  if (shouldAddAuthDirective(config, 'hasScope')) {
    typeMap['hasScope'] = (0, _graphql.parse)(
      'directive @hasScope(scopes: [String]) on OBJECT | FIELD_DEFINITION'
    ).definitions[0];
  }

  return typeMap;
};

exports.possiblyAddDirectiveDeclarations = possiblyAddDirectiveDeclarations;

var possiblyAddDirectiveImplementations = function possiblyAddDirectiveImplementations(
  schemaDirectives,
  typeMap,
  config
) {
  if (shouldAddAuthDirective(config, 'isAuthenticated')) {
    schemaDirectives['isAuthenticated'] =
      _graphqlAuthDirectives.IsAuthenticatedDirective;
  }

  if (shouldAddAuthDirective(config, 'hasRole')) {
    getRoleType(typeMap); // ensure Role enum specified in typedefs

    schemaDirectives['hasRole'] = _graphqlAuthDirectives.HasRoleDirective;
  }

  if (shouldAddAuthDirective(config, 'hasScope')) {
    schemaDirectives['hasScope'] = _graphqlAuthDirectives.HasScopeDirective;
  }

  return schemaDirectives;
};

exports.possiblyAddDirectiveImplementations = possiblyAddDirectiveImplementations;

var getRoleType = function getRoleType(typeMap) {
  var roleType = typeMap['Role'];

  if (!roleType) {
    throw new Error(
      'A Role enum type is required for the @hasRole auth directive.'
    );
  }

  return roleType;
};

var possiblyAddScopeDirective = function possiblyAddScopeDirective(_ref) {
  var typeName = _ref.typeName,
    relatedTypeName = _ref.relatedTypeName,
    operationType = _ref.operationType,
    entityType = _ref.entityType,
    config = _ref.config;

  if (shouldAddAuthDirective(config, 'hasScope')) {
    if (entityType === 'node') {
      if (
        operationType === 'Create' ||
        operationType === 'Read' ||
        operationType === 'Update' ||
        operationType === 'Delete'
      ) {
        return (0, _utils.parseDirectiveSdl)(
          '@hasScope(scopes: ["'
            .concat(typeName, ': ')
            .concat(operationType, '"])')
        );
      }
    }

    if (entityType === 'relation') {
      if (operationType === 'Add') operationType = 'Create';
      else if (operationType === 'Remove') operationType = 'Delete';
      return '@hasScope(scopes: ["'
        .concat(typeName, ': ')
        .concat(operationType, '", "')
        .concat(relatedTypeName, ': ')
        .concat(operationType, '"])');
    }
  }

  return undefined;
};

exports.possiblyAddScopeDirective = possiblyAddScopeDirective;
