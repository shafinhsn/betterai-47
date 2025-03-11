
import { ChatContainer } from './chat/ChatContainer';
import type { ChatProps } from '@/types/chat';

export const Chat = (props: ChatProps) => {
  return <ChatContainer {...props} />;
};
