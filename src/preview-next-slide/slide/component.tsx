import * as React from 'react';
import './styles.css';
import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { getNextSlideSub, getTotalPagesSub } from './queries';

interface SlideContainerProps {
  toolbarIsVertical: boolean;
  pluginApi: PluginApi;
}

interface SlideProps {
  toolbarIsVertical: boolean;
  svgUrl: string;
}

const extractAndIncrementLastNumber = (url: string): { originalNumber: number; incrementedUrl: string } | null => {
  const match = url.match(/(\d+)(?=[^\/]*$)/);
  
  if (!match) return null;

  const originalNumber = parseInt(match[0], 10);
  const incrementedNumber = originalNumber + 1;
  const incrementedUrl = url.replace(/(\d+)(?=[^\/]*$)/, incrementedNumber.toString());

  return { originalNumber, incrementedUrl };
};

// eslint-disable-next-line
const Slide: React.FC<SlideProps> = ({
  toolbarIsVertical,
  svgUrl,
}) => {
  const [isHovering, setIsHovering] = React.useState(false);

  const hoverStyle = toolbarIsVertical ? {
    top: isHovering ? '0px' : '80px',
  } : {
    left: isHovering ? '0px' : '180px',
  };

  return (
    <div
      style={{
        overflow: 'hidden',
        height: '120px',
        width: '213px',
      }}
      onMouseEnter={(ev) => {
        setIsHovering(true);
      }}
      onMouseLeave={(ev) => {
        setIsHovering(false);
      }}
      onClick={() => {
        const nextSlideButton = document.querySelector('button[data-test="nextSlide"]')
        // @ts-ignore 
        nextSlideButton.click();
      }}
    >
      <div
        style={{
          position: 'relative',
          ...hoverStyle,
        }}
      >
        <img
          style={{
            border: '1px solid #000',
          }}
          alt="next slide"
          width="213"
          height="120"
          src={svgUrl}
        />
          <div className="overlay-container">
            <div className="overlay-text">Next</div>
          </div>
      </div>
    </div>
  );
};

const SlideContainer: React.FC<SlideContainerProps> = ({
  pluginApi,
  toolbarIsVertical,
}) => {

  const {
    data,
    error,
    loading,
  } = pluginApi.useCustomSubscription(getNextSlideSub);


  const  {
    data: totalPagesData,
    error: totalPagesError,
    loading: totalPagesLoading,
  } = pluginApi.useCustomSubscription(getTotalPagesSub);

  if (loading || error || !data) return null;
  if (totalPagesLoading || totalPagesError || !totalPagesData) return null;
// @ts-ignore
  const { pres_page_curr } = data;
// @ts-ignore
  const { svgUrl } = pres_page_curr[0];
  const {originalNumber, incrementedUrl: nextPage} = extractAndIncrementLastNumber(svgUrl);
  // @ts-ignore
  if (originalNumber >= totalPagesData.pres_presentation[0].totalPages) return null;
  return (
    <Slide
      toolbarIsVertical={toolbarIsVertical}
      svgUrl={nextPage}
    />
  );
  
};

export default SlideContainer;
