import React, { Component } from "react";
import { Layout } from "./styles";
import ReactMonaco from "./ReactMonaco";

import debounce from "lodash/debounce";

import { connect } from "react-redux"; // Note, avoid the temptation to include '@types/react-redux', it will break compile-time!
import { actions, selectors } from "../../../store";
import { IState as IReduxState } from "../../../store/reducer";
import { IRootAction } from "../../../store/actions";

import {
  SETTINGS_SOLUTION_ID,
  EDIT_FILE_DEBOUNCE_MS,
  EDIT_SETTINGS_DEBOUNCE_MS,
} from "../../../../../constants";
import { Dispatch } from "redux";

interface IPropsFromRedux {
  backgroundColor: string;
  tabSize: number;

  activeSolution: ISolution;
  activeFile: IFile;
}

const mapStateToProps = (state: IReduxState): IPropsFromRedux => ({
  backgroundColor: selectors.settings.getBackgroundColor(state),
  activeSolution: selectors.editor.getActiveSolution(state),
  activeFile: selectors.editor.getActiveFile(state),
  tabSize: selectors.settings.getTabSize(state),
});

interface IActionsFromRedux {
  editFile: (solutionId: string, fileId: string, file: Partial<IEditableFileProperties>) => void;
  editSettings: (newSettings: string) => void;
  openSettings: () => void;
  signalEditorLoaded: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  applyFormatting: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<IRootAction>): IActionsFromRedux => ({
  editFile: (solutionId: string, fileId: string, file: Partial<IEditableFileProperties>) =>
    dispatch(actions.solutions.edit({ id: solutionId, fileId, file })),
  editSettings: (newSettings: string) => dispatch(actions.settings.editFile({ newSettings })),
  openSettings: () => dispatch(actions.settings.open()),
  signalEditorLoaded: (editor: monaco.editor.IStandaloneCodeEditor) =>
    dispatch(actions.editor.onMount(editor)),
  applyFormatting: () => dispatch(actions.editor.applyFormatting()),
});

export interface IProps extends IPropsFromRedux, IActionsFromRedux {}

export class Editor extends Component<IProps> {
  editFile = debounce(
    (solutionId: string, fileId: string, content: string) =>
      this.props.editFile(solutionId, fileId, { content }),
    EDIT_FILE_DEBOUNCE_MS,
  );

  editSettings = debounce(
    (newSettings: string) => this.props.editSettings(newSettings),
    EDIT_SETTINGS_DEBOUNCE_MS,
  );

  onValueChange = (solutionId: string, fileId: string, content: string) =>
    solutionId === SETTINGS_SOLUTION_ID
      ? this.editSettings(content)
      : this.editFile(solutionId, fileId, content);

  signalEditorLoaded = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_COMMA, this.props.openSettings, "");
    this.props.signalEditorLoaded(editor);
  };

  render() {
    const { backgroundColor, tabSize } = this.props;

    return (
      <Layout style={{ backgroundColor }}>
        <ReactMonaco
          solutionId={this.props.activeSolution.id}
          file={this.props.activeFile}
          tabSize={tabSize}
          onValueChange={this.onValueChange}
          editorDidMount={this.signalEditorLoaded}
          applyFormatting={this.props.applyFormatting}
        />
      </Layout>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
