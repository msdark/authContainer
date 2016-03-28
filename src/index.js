import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import { memoize } from 'lodash/fp'

const defaults = {
	authSelector: memoize((authData) => {
		if (Immutable.Map.isMap(authData)) {
			return authData.get('authenticated')
		}
		return authData.authenticated
	}),
	redirectOnFailure: '/login',
}

export const AuthContainer = (args) => {
	const { authSelector, redirectOnFailure } = { ...defaults, ...args }

	const isAuthenticated = memoize((state) => authSelector(state))

	const checkAuth = (state, router) => {
		if (!isAuthenticated(state)) {
			router.replace({
				pathname: redirectOnFailure,
				query: {},
				state,
			})
		}
	}

	const composed = (ComposedComponent) => {
		function mapStateToProps(state) {
			return { user: state.get('user') }
		}
		@connect(mapStateToProps)
		class Composed extends Component {
			static propTypes = {
				user: PropTypes.object,
			}

			static contextTypes = {
				router: PropTypes.object.isRequired,
			}

			componentWillMount() {
				checkAuth(this.props.user, this.context.router)
			}

			componentWillReceiveProps(nextProps) {
				checkAuth(nextProps.user, this.context.router)
			}
			render() {
				if (isAuthenticated(this.props.user)) {
					return <ComposedComponent {...this.props} />
				}
				return <div />
			}
		}
		return Composed
	}

	return composed
}