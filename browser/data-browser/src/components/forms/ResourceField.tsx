import { useProperty, Resource, Property } from '@tomic/react';
import { styled } from 'styled-components';
import Field from './Field';
import Markdown from '../datatypes/Markdown';
import { InputWrapper, InputStyled } from './InputStyles';
import InputSwitcher from './InputSwitcher';
import { AtomicLink } from '../AtomicLink';
import { useId, useState } from 'react';
import { Button } from '../Button';

function generateErrorPropName(prop: Property): string {
  if (prop.error) {
    const endOfPath = prop.subject.split('/').pop();

    return endOfPath || 'error';
  } else return prop.shortname;
}

/** An input field for a single Property, rendered with a Label. Has a loading state. */
function ResourceField({
  handleDelete,
  propertyURL,
  resource,
  required,
  autoFocus,
  disabled,
  label: labelProp,
}: IFieldProps): JSX.Element {
  const id = useId();
  const property = useProperty(propertyURL);
  const [collapsedDynamic, setCollapsedDynamic] = useState(true);

  if (property === null) {
    return (
      <Field label={labelProp || 'loading...'} fieldId={id}>
        <InputWrapper>
          <InputStyled
            disabled={disabled}
            placeholder='loading property...'
            id={id}
          />
        </InputWrapper>
      </Field>
    );
  }

  const label =
    labelProp || property.error
      ? generateErrorPropName(property)
      : property.shortname;

  if (property.isDynamic && collapsedDynamic) {
    return (
      <Field
        helper={
          <HelperText text={property.description} link={property.subject} />
        }
        label={label}
        disabled={disabled}
      >
        {'This field is calculated server-side, edits will not be saved. '}
        <Button subtle onClick={() => setCollapsedDynamic(false)}>
          edit anyway
        </Button>
      </Field>
    );
  }

  return (
    <Field
      helper={
        <HelperText text={property.description} link={property.subject} />
      }
      label={label}
      handleDelete={handleDelete}
      required={required}
      disabled={disabled}
      fieldId={id}
    >
      <InputSwitcher
        id={id}
        key={propertyURL + ' input-switcher'}
        data-test={`input-${property.shortname}`}
        resource={resource}
        property={property}
        required={required}
        autoFocus={autoFocus}
        disabled={disabled}
      />
    </Field>
  );
}

interface HelperTextProps {
  text: string;
  link: string;
}

const HelperTextWraper = styled.div`
  position: relative;
  margin-bottom: 0rem;
`;

function HelperText({ text, link }: HelperTextProps) {
  return (
    <HelperTextWraper>
      <Markdown text={text} />
      <AtomicLink subject={link}>{link}</AtomicLink>
    </HelperTextWraper>
  );
}

/** A single field in a Resource form should receive these */
export type InputProps = {
  id?: string;
  /** The resource that is being edited */
  resource: Resource;
  /** The property of the resource that is being edited */
  property: Property;
  /** Whether the field must have a valid value before submitting */
  required?: boolean;
  disabled?: boolean;
  /** Whether the field should be focused on render */
  autoFocus?: boolean;
  commit?: boolean;
};

interface IFieldProps {
  /** Subject of the Property */
  propertyURL: string;
  /** The resource being edited */
  resource: Resource;
  /** Whether the field must have a valid value before submitting */
  required?: boolean;
  /** Overwrites the label with a custom one. Defaults to the shortname of the property */
  label?: string;
  disabled?: boolean;
  /** Whether the field should be focused on render */
  autoFocus?: boolean;
  /**
   * This function will be called when the delete icon is clicked. This should
   * remove the item from any parent list
   */
  handleDelete?: () => unknown;
}

export default ResourceField;
