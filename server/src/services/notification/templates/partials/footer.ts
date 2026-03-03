export const footerBlock = (extraNote?: string): string => `
  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
    這是一封自動發送的郵件，請勿直接回复。${extraNote ? `<br>${extraNote}` : ''}
  </div>
`;
