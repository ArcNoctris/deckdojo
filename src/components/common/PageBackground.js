import React from 'react';
import PropTypes from 'prop-types';

const PageBackground = ({ backgroundImage, children }) => {
  return (
    <div className="page-background-wrapper">
      {/* Blurred, stretched background */}
      <div
        className="page-blur-bg"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />
      {/* Content */}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

PageBackground.propTypes = {
  backgroundImage: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default PageBackground; 