// import React, { useState } from "react";
// import { Edit, MessageCircle, Orbit, PanelLeftDashed } from 'lucide-react';
// import { groupChatsByDate } from '../../utils/dateUtils';

// interface ChatHistory {
//   id: string;
//   title: string;
//   timestamp: string;
//   model: string;
//   preview: string;
// }

// interface LeftChatHistoryProps {
//   history: ChatHistory[];
//   onMessageClick?: (id: string) => void;
// }

// const LeftChatHistory: React.FC<LeftChatHistoryProps> = ({ history, onMessageClick }) => {
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const restartConversation = () => {
//     if (window.confirm('Are you sure you want to start a new conversation? Current conversation will be cleared.')) {
//       window.location.reload();
//     }
//   };

//   const saveConversationToFile = () => {
//     const conversationData = JSON.stringify(history, null, 2);
//     const blob = new Blob(
//       [`export const savedConversation = ${conversationData};`], 
//       { type: 'application/javascript' }
//     );
    
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const filename = `conversation-${timestamp}.js`;
    
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = filename;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const groupedHistory = groupChatsByDate(history);

//   return (
//     <div className={`font-sans border border-[--border-color] dark:border-gray-700 rounded-lg max-w-[300px] h-screen flex flex-col transition-all duration-300 ease-in-out bg-gray-100 dark:bg-gray-800 ${
//       isCollapsed ? 'w-10' : 'w-[300px]'
//     }`}>
//       <div className="flex-shrink-0">
//         <div className="flex items-center gap-2 justify-between p-4 border-b border-[--border-color] dark:border-gray-700 bg-inherit">
//           <span 
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="cursor-pointer transition-opacity duration-200 hover:opacity-70"
//           >
//             <PanelLeftDashed size={24} />
//           </span>
//           <span 
//             onClick={restartConversation}
//             className="cursor-pointer transition-opacity duration-200 hover:opacity-70"
//           >
//             <Edit size={24} />
//           </span>
//         </div>
//       </div>

//       {!isCollapsed && (
//         <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
//           {Object.entries(groupedHistory).map(([dateGroup, chats]) => (
//             <div key={dateGroup} className="mb-4">
//               <div className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
//                 {dateGroup}
//               </div>
//               {chats.map((chat) => (
//                 <div
//                   key={chat.id}
//                   className="px-4 py-3 cursor-pointer border-b border-[--border-color] dark:border-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700/50 last:border-b-0"
//                   onClick={() => onMessageClick?.(chat.id)}
//                 >
//                   <div className="flex items-start gap-2 overflow-x-hidden">
//                     <div className="block whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed text-sm text-gray-900 dark:text-gray-100 pr-5">
//                       {chat.preview}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="h-12 px-4 py-2 flex flex-row gap-2 items-center">
//         <span>
//           <Orbit size={24} />
//         </span>
//         <div className="flex flex-col gap-1">
//           <span className="text-sm font-semibold">
//             Upgrade plan
//           </span>
//           <span className="text-sm">
//             More access to best model
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LeftChatHistory; 