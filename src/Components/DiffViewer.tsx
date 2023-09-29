import { PureComponent } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import { Accordion, Button, Icon } from 'semantic-ui-react';
import Prism from 'prismjs';

import './diff.scss';

interface Props {
  codeData: Array<{
    fileName: string;
    testFilePath: string;
    currentCode: string;
    updatedCode: string;
  }>;
  download: Function
}

class Diff extends PureComponent<Props, { fileDiffVisibility: Array<boolean> }> {
  constructor(props: Props) {
    super(props);
    this.state = {
      fileDiffVisibility: props.codeData.map(f => true),
    }
  }

  private syntaxHighlight = (str: string): any => {
    if (!str) return;
    const language = Prism.highlight(str, Prism.languages.javascript);
    return <span dangerouslySetInnerHTML={{ __html: language }} />;
  };

  handleClick = (index: number) => {
    const { fileDiffVisibility } = this.state;
    const updatedVisibiltyState = [
      ...fileDiffVisibility.slice(0, index),
      !fileDiffVisibility[index],
      ...fileDiffVisibility.slice(index + 1)
    ]

    this.setState({ fileDiffVisibility: updatedVisibiltyState })
  }

  render = () => {
    const { codeData, download } = this.props;

    const { fileDiffVisibility } = this.state;
    const style = {
      variables: {
        dark: {
          diffViewerTitleColor: '#fff',
        }
      },
      titleBlock: {
        textAlign: 'center' as any,
        fontWeight: '600' as any
      },
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column'}}>
        {codeData.length ? (
          <Button
            positive
            onClick={() => download()}
            style={{ alignSelf: 'flex-end' }}
          >
            Download
          </Button>
        ) : null}
        {codeData.map((file, i) =>
        (
          <Accordion fluid key={file.fileName}>
            <Accordion.Title
              active={false}
              index={i}
              onClick={() => this.handleClick(i)}
              className='accordion-title'
            >
              <Icon size='large' name={fileDiffVisibility[i] ? 'caret down' : 'caret right'} />
              {file.fileName}
            </Accordion.Title>
            <Accordion.Content active={fileDiffVisibility[i]}>
              <div className="diff-viewer">
                <ReactDiffViewer
                  oldValue={file.currentCode}
                  newValue={file.updatedCode}
                  splitView={true}
                  renderContent={this.syntaxHighlight}
                  useDarkTheme={true}
                  leftTitle="Current Code"
                  rightTitle="Updated Code"
                  styles={style}
                />
              </div>
            </Accordion.Content>
          </Accordion>
        )
        )}
        {!codeData.length && (
          <p>Nothing to show...</p>
        )
        }
      </div>)
  };
}

export default Diff;