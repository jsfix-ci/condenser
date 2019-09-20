import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as transactionActions from 'app/redux/TransactionReducer';

import SettingsEditButton from './SettingsEditButton';

class SettingsEditButtonContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            loading: false,
            settings: this.props.settings,
        };
    }

    onToggleDialog = () => {
        this.setState({ showDialog: !this.state.showDialog });
    };

    onSave = newSettings => {
        console.log(
            'SettingsEditButtonContainer::onSave::newSettings',
            newSettings
        );
        const community = this.props.community.get('name');
        this.setState({ loading: true });
        this.props.saveSettings(
            this.props.username,
            community,
            newSettings,
            () => {
                console.log('onSave::Success()');
                this.setState({ loading: false, settings: newSettings });
            },
            () => {
                console.log('onSave::failure()');
                this.setState({ loading: false });
            }
        );
    };

    render() {
        // const { subscribed } = this.state;
        console.log(
            'SettingsEditButtonContainer->render()',
            this.state.settings
        );

        const label = `Settings`;

        return (
            <SettingsEditButton
                {...this.state}
                onSave={this.onSave}
                onToggleDialog={this.onToggleDialog}
                label={label}
            />
        );
    }
}

SettingsEditButtonContainer.propTypes = {
    username: PropTypes.string.isRequired,
    community: PropTypes.object.isRequired, //TODO: Define this shape
    settings: PropTypes.object.isRequired, //TODO: Define this shape
};

export default connect(
    (state, ownProps) => {
        const community = state.global.getIn(
            ['community', ownProps.community],
            {}
        );
        const settings = {
            title: community.get('title'),
            about: community.get('about'),
            is_nsfw: community.get('is_nsfw'),
            description: community.get('description'),
            flag_text: '', //TODO: Where is flag_text supposed to be?
        };

        return {
            ...ownProps,
            username: state.user.getIn(['current', 'username']),
            community,
            settings,
        };
    },
    dispatch => ({
        saveSettings: (
            account,
            community,
            settings,
            successCallback,
            errorCallback
        ) => {
            const action = 'updateProps';

            const payload = [
                action,
                {
                    community,
                    props: settings,
                },
            ];

            return dispatch(
                transactionActions.broadcastOperation({
                    type: 'custom_json',
                    operation: {
                        id: 'community',
                        required_posting_auths: [account],
                        json: JSON.stringify(payload),
                    },
                    successCallback,
                    errorCallback,
                })
            );
        },
    })
)(SettingsEditButtonContainer);
