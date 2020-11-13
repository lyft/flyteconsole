import {
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from '@material-ui/core';
import { log } from 'common/log';
import { getCacheKey } from 'components/Cache';
import { NewTargetLink } from 'components/common/NewTargetLink';
import { useDebouncedValue } from 'components/hooks/useDebouncedValue';
import { Admin } from 'flyteidl';
import * as React from 'react';
import { launchInputDebouncDelay, roleTypes } from './constants';
import { makeStringChangeHandler } from './handlers';
import { useInputValueCacheContext } from './inputValueCache';
import { useStyles } from './styles';
import { LaunchRoleInputRef, RoleType, RoleTypeValue } from './types';

const roleHeader = 'Role';
const iamHelperText = 'Enter a string to use as the role value';
const roleDocLinkUrl =
    'https://github.com/lyft/flyteidl/blob/3789005a1372221eba28fa20d8386e44b32388f5/protos/flyteidl/admin/common.proto#L241';
const roleValueLabel = 'role value';
const roleTypeLabel = 'type';
const roleInputId = 'launch-auth-role';

function getDefaultRoleTypeValue(): RoleType {
    return roleTypes.iamRole;
}

export interface LaunchRoleInputProps {
    showErrors: boolean;
}

interface LaunchRoleInputState {
    error?: string;
    roleType: RoleType;
    roleString?: string;
    getValue(): Admin.IAuthRole;
    onChangeRoleString(newValue: string): void;
    onChangeRoleType(newValue: string): void;
    validate(): boolean;
}

function getRoleTypeByValue(value: string): RoleType | undefined {
    return Object.values(roleTypes).find(
        ({ value: roleTypeValue }) => value === roleTypeValue
    );
}

const roleTypeCacheKey = '__roleType';
const roleStringCacheKey = '__roleString';

export function useRoleInputState(): LaunchRoleInputState {
    const inputValueCache = useInputValueCacheContext();

    const [error, setError] = React.useState<string>();
    const [roleString, setRoleString] = React.useState<string>(
        inputValueCache.has(roleStringCacheKey)
            ? `${inputValueCache.get(roleStringCacheKey)}`
            : ''
    );

    const [roleType, setRoleType] = React.useState<RoleType>(() => {
        let roleType: RoleType | undefined;
        if (inputValueCache.has(roleTypeCacheKey)) {
            const cachedValue = `${inputValueCache.get(roleTypeCacheKey)}`;
            roleType = getRoleTypeByValue(cachedValue);
            if (roleType === undefined) {
                log.error(`Unexepected cached role type: ${cachedValue}`);
            }
        }
        return roleType ?? getDefaultRoleTypeValue();
    });

    const validationValue = useDebouncedValue(
        roleString,
        launchInputDebouncDelay
    );

    const getValue = () => ({ [roleType.value]: roleString });
    const validate = () => {
        if (roleString == null || roleString.length === 0) {
            setError('Value is required');
            return false;
        }
        setError(undefined);
        return true;
    };

    const onChangeRoleString = (value: string) => {
        inputValueCache.set(roleStringCacheKey, value);
        setRoleString(value);
    };

    const onChangeRoleType = (value: string) => {
        const newRoleType = getRoleTypeByValue(value);
        if (newRoleType === undefined) {
            throw new Error(`Unexpected role type value: ${value}`);
        }
        inputValueCache.set(roleTypeCacheKey, value);
        setRoleType(newRoleType);
    };

    React.useEffect(() => {
        validate();
    }, [validationValue]);

    return {
        error,
        getValue,
        onChangeRoleString,
        onChangeRoleType,
        roleType,
        roleString,
        validate
    };
}

const RoleDescription = () => (
    <>
        <Typography variant="body2">
            Enter a
            <NewTargetLink inline={true} href={roleDocLinkUrl}>
                &nbsp;role&nbsp;
            </NewTargetLink>
            to assume for this execution.
        </Typography>
    </>
);

export const LaunchRoleInputImpl: React.RefForwardingComponent<
    LaunchRoleInputRef,
    LaunchRoleInputProps
> = ({ showErrors }, ref) => {
    const styles = useStyles();
    const {
        error,
        getValue,
        roleType,
        roleString = '',
        onChangeRoleString,
        onChangeRoleType,
        validate
    } = useRoleInputState();
    const hasError = showErrors && !!error;
    const helperText = hasError ? error : roleType.helperText;

    React.useImperativeHandle(ref, () => ({
        getValue,
        validate
    }));

    return (
        <section>
            <header className={styles.sectionHeader}>
                <Typography variant="h6">{roleHeader}</Typography>
                <RoleDescription />
            </header>
            <FormControl component="fieldset">
                <FormLabel component="legend">{roleTypeLabel}</FormLabel>
                <RadioGroup
                    aria-label="roleType"
                    name="roleType"
                    value={roleType.value}
                    row={true}
                    onChange={makeStringChangeHandler(onChangeRoleType)}
                >
                    {Object.values(roleTypes).map(({ label, value }) => (
                        <FormControlLabel
                            key={value}
                            value={value}
                            control={<Radio />}
                            label={label}
                        />
                    ))}
                </RadioGroup>
            </FormControl>
            <div className={styles.formControl}>
                <TextField
                    error={hasError}
                    id={roleInputId}
                    helperText={helperText}
                    fullWidth={true}
                    label={roleType.inputLabel}
                    onChange={makeStringChangeHandler(onChangeRoleString)}
                    value={roleString}
                    variant="outlined"
                />
            </div>
        </section>
    );
};

/** Renders controls for selecting an AuthRole type and inputting a value for it. */
export const LaunchRoleInput = React.forwardRef(LaunchRoleInputImpl);
