'use client';

import { Field as ChakraField } from '@chakra-ui/react';
import * as React from 'react';

export interface FieldProps extends Omit<ChakraField.RootProps, 'label'> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  optionalText?: React.ReactNode;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  function Field(props, ref) {
    const { label, children, helperText, errorText, optionalText, ...rootProps } = props;
    return (
      <ChakraField.Root ref={ref} {...rootProps}>
        {label && (
          <ChakraField.Label>
            {label}
            {optionalText && <span style={{ fontSize: '0.875rem', color: 'gray' }}> {optionalText}</span>}
          </ChakraField.Label>
        )}
        {children}
        {helperText && <ChakraField.HelperText>{helperText}</ChakraField.HelperText>}
        {errorText && <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>}
      </ChakraField.Root>
    );
  }
);
