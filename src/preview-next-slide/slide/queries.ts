export const getNextSlideSub = `
subscription CurrentPresentationPagesSubscription {
  pres_page_curr {
    svgUrl: urlsJson(path: "$.svg")
  }  
}
`;
export const getTotalPagesSub = `
  subscription totalPagesSubscription {
    pres_presentation {
      totalPages
    }
  }
`;

export default {
  getNextSlideSub,
  getTotalPagesSub,
};
