import React from "react";
import DnR from 'react-dnr';

const defaultTheme = {
  title: {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
    MozUserSelect: 'none',
    OUserSelect: 'none',
    overflow: 'hidden',
    width: '100%',
    height: 25,
  },
  frame: {
    position: 'absolute',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  },
  transition: 'all 0.25s ease-in-out'
};

class Button extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hover: false,
      down: false,
    };
  }
  render() {
    const {
      style,
      hoverStyle,
      downStyle,
      children,
      ...other,
    } = this.props;

    let buttonStyle = {
      ...style,
      ...(this.state.hover ? hoverStyle : {}),
      ...(this.state.down ? downStyle : {})
    };
    return (
      <button
        onMouseEnter={()=>this.setState({hover:true})}
        onMouseLeave={()=>this.setState({hover:false,down:false})}
        onMouseDown={()=>this.setState({down:true})}
        onMouseUp={()=>this.setState({down:false})}
        style={buttonStyle}
        {...other}>
        {children}
      </button>);
  }
}

const TitleBar = ({
  children,
  buttons,
  button1,
  button2,
  button3,
  button1Children,
  button2Children,
  button3Children,
  ...other
}) =>
  <div {...other}>
    <div {...buttons}>
      <Button {...button1}>
        {button1Children}
      </Button>
      <Button {...button2}>
        {button2Children}
      </Button>
      <Button {...button3}>
        {button3Children}
      </Button>
    </div>
    {children}
  </div>

export let TerminalTheme = ({title, onClose, onMinimize, onMaximize, titleBarColor = '#0095ff'}) => {
  const titleHeight = 25;
  const buttonRadius = 6;
  const fontSize = 14;
  const fontFamily = 'Helvetica, sans-serif';

  const style = {
      height: titleHeight,
  };

  const buttonStyle = {
    padding: 0,
    margin: 0,
    width: 25,
    height: 25,
    outline: 'none',
    border: 'none',
    textAlign: 'center'
  };

  const buttons = {
    style: {
      height: titleHeight,
      position: 'absolute',
      right: 0,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      verticalAlign: 'baseline',
    }
  };

  const closeButton = {
    style: {
      ...buttonStyle,
      fontSize: '20px',
      fontWeight: 500,
      lineHeight: '36px',
      backgroundColor: titleBarColor,
    },
    hoverStyle: {
      backgroundColor: '#ec6060'
    },
    downStyle: {
      backgroundColor: '#bc4040'
    },
    onClick: onClose
  };

  const minimizeButton = {
    style: {
      ...buttonStyle,
      lineHeight: '22px',
      backgroundColor: titleBarColor,
    },
    hoverStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },
    downStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.2)'
    },
    onClick: onMinimize
  };

  const maximizeButton = {
    style: {
      ...buttonStyle,
      lineHeight: '12px',
      backgroundColor: titleBarColor
    },
    hoverStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    downStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    onClick: onMaximize
  };
  return {
    theme: {
      title: {
        ...defaultTheme.title,
        fontFamily: fontFamily,
        background: titleBarColor,
        color: 'rgba(0, 0, 0, 0.7)',
        fontSize: fontSize,
        height: titleHeight,
      },
      frame: {
        ...defaultTheme.frame,
      },
      transition: 'all 0.25s ease-in-out'
    },
    titleBar: (<TitleBar
        style={style}
        buttons={buttons}
        button1={minimizeButton}
        button2={maximizeButton}
        button3={closeButton}
        button1Children='‒'
        button2Children='□'
        button3Children='˟'>
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {title}
          </div>
      </TitleBar>),
  };
};

export default class Terminal extends React.Component {
  constructor(props) {
    super(props);
    this.theme = TerminalTheme({
      title: 'Terminal',
      onClose: ()=>this.refs.dnr.minimize(),
      onMinimize: ()=>this.refs.dnr.minimize(),
      onMaximize: ()=>this.refs.dnr.maximize(),
    });
  }
  injectContent(node) {
    if (this.node) {
      this.refs.content.removeChild(node)
    }
    this.node = node
    this.refs.content.appendChild(this.node)
    this.forceUpdate()
  }
  render() {
    let node = this.node
    let terminal = this
    return (
      <div>
        <DnR
          ref='dnr'
          {...this.theme}
          cursorRemap={(c) => c === 'move' ? 'default' : null}
          style={{
            width: 500,
            height: 400,
            bottom: 0,
            right: 0,
            position: 'fixed',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}>
          <div
            style={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              overflow: 'hidden'
            }}
            ref='content'>
          </div>
        </DnR>
      </div>
    );
  }
}
