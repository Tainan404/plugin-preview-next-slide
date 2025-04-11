import { BbbPluginSdk, FloatingWindow, PresentationToolbarButton } from 'bigbluebutton-html-plugin-sdk';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import Slide from './slide/component';

interface PluginHelloWorldProps {
  pluginUuid: string;
}

function PluginPreviewNextSlide(
  { pluginUuid }: PluginHelloWorldProps,
): React.ReactElement {
  BbbPluginSdk.initialize(pluginUuid);
  const pluginApi = BbbPluginSdk.getPluginApi(pluginUuid);

  const [isMinimized, setIsMinimized] = React.useState(false);
  const [WBresizeObserver, setWBResizeObserver] = React.useState<ResizeObserver | null>(null);
  const [isToolbarVertical, setIsToolbarVertical] = React.useState(false);
  const [windowTop, setWindowTop] = React.useState(0);
  const [windowLeft, setWindowLeft] = React.useState(0);

  const imageSizeRef = React.useRef({ width: 213, height: 120 });

  React.useEffect(() => {
    if (!WBresizeObserver) {
      const whiteboardElement = document.getElementById('presentationInnerWrapper');

      if (whiteboardElement) {
        const observer = new ResizeObserver((entries) => {
          // eslint-disable-next-line
          for (const entry of entries) {
            const toolbarElement = document.querySelector('div.tlui-toolbar');
            const toolbarRect = toolbarElement?.getBoundingClientRect();
            const element = entry.target as HTMLElement;
            const rect = element.getBoundingClientRect();
            const toolbarIsVertical = toolbarRect.height > toolbarRect.width;
            setIsToolbarVertical(toolbarIsVertical);
            if (toolbarIsVertical) {
              const toolbarWidth = toolbarRect.width + 20;
              const whiteboardTop = rect.top + rect.height - imageSizeRef.current.height;
              const whiteboardLeft = rect.left
                + rect.width - imageSizeRef.current.width - toolbarWidth;
              setWindowTop(whiteboardTop);
              setWindowLeft(whiteboardLeft);
            } else {
              const toolbarHeight = toolbarRect.height;
              const whiteboardTop = (rect.top
                + rect.height - imageSizeRef.current.height) - toolbarHeight;
              const whiteboardLeft = rect.left + rect.width - imageSizeRef.current.width;
              setWindowTop(whiteboardTop);
              setWindowLeft(whiteboardLeft);
            }
          }
        });
        observer.observe(whiteboardElement);
        setWBResizeObserver(observer);
      }
    }
    return () => {
      if (WBresizeObserver) {
        WBresizeObserver.disconnect();
      }
      setWBResizeObserver(null);
      setWindowTop(-1);
      setWindowLeft(-1);
    };
  }, []);

  React.useEffect(() => {
    if (!isMinimized) {
      const floatingWindow = new FloatingWindow({
        top: windowTop,
        left: windowLeft,
        movable: false,
        backgroundColor: '',
        boxShadow: '',
        contentFunction: (element: HTMLElement) => {
          const root = ReactDOM.createRoot(element);
          root.render(
            <Slide
              toolbarIsVertical={isToolbarVertical}
              pluginApi={pluginApi}
            />,
          );
          return root;
        },
      });
      pluginApi.setActionsBarItems([]);
      pluginApi.setFloatingWindows([floatingWindow]);
    } else if (isMinimized) {
      pluginApi.setFloatingWindows([]);
    }

    const restoringButton: PresentationToolbarButton = new PresentationToolbarButton({
      tooltip: 'Toogle next slide preview',
      onClick: () => {
        setIsMinimized(prev => !prev);
      },
      label: isMinimized ? 'Show Preview' : 'Hide Preview',
      style: {
        backgroundColor: 'white',
        color: 'black',
        borderRadius: '5px',
        padding: '5px 10px',
      },
    });
    pluginApi.setPresentationToolbarItems([restoringButton]);
  }, [windowTop, windowLeft, isMinimized]);

  return null;
}
export default PluginPreviewNextSlide;
