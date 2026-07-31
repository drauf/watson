import Button from '@atlaskit/button/new';
import ModalDialog, {
  CloseButton, ModalBody, ModalFooter, ModalHeader, ModalTitle,
} from '@atlaskit/modal-dialog';
import Text from '@atlaskit/primitives/text';

import type { JSX } from 'react';

interface Props {
  message: string;
  onClose: () => void;
  onAnalyze: () => void;
}

const LargeRangeConfirmationDialog = ({ message, onClose, onAnalyze }: Props): JSX.Element => (
  <ModalDialog onClose={onClose} shouldCloseOnOverlayClick>
    <ModalHeader>
      <ModalTitle appearance="warning">Large time window selected</ModalTitle>
      <CloseButton label="Close dialog" onClick={onClose} />
    </ModalHeader>
    <ModalBody>
      <Text as="p">{message}</Text>
    </ModalBody>
    <ModalFooter>
      <Button appearance="default" onClick={onClose}>Choose smaller window</Button>
      <Button appearance="warning" onClick={onAnalyze}>Analyze anyway</Button>
    </ModalFooter>
  </ModalDialog>
);

export default LargeRangeConfirmationDialog;
