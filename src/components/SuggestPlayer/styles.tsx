import { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import styled from 'styled-components';

export const SuggestionsContainer = styled(Paper)`
  position: absolute;
  left: 0;
  right: 0;
  z-index: 10;

  .suggestions-list {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
`;

export const SuggestionResult = styled(MenuItem).attrs({
  component: 'div'
})`
  display: block;

  span {
    font-weight: 300;
  }

  strong {
    font-weight: 500;
  }
`;

export const TextBox = styled(TextField)`
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;

  input {
    color: white;
    padding-left: 0.5rem;
  }
`;
