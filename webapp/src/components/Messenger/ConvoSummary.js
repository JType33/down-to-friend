import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadConvo } from '../../store/messenger';

export default function ConvoSummary ({ convo }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.session.user);
  const socket = useSelector(state => state.messenger.socket);
  const conversation = useSelector(state => state.messenger.conversation);

  const [unread, setUnread] = useState(false);

  const remainingUsers = convo.ChattingUsers.filter(({ id }) => id !== user.id);

  const onSelectConvo = () => {
    setUnread(false);
    socket.emit(`viewing-${convo.id}`);
    dispatch(LoadConvo(convo.id));
  };

  useEffect(() => {
    socket && socket.on(`convo-${convo.id}`, () => {
      if (!(conversation === convo.id)) {
        setUnread(true);
      }
    });
    return () => {
      socket && socket.off(`convo-${convo.id}`);
    };
  }, [socket, conversation, convo.id]);

  return (
    <div
      className={`convo-summary-container${
        unread
          ? ' unread'
          : ''
      }${
        convo.id === conversation
          ? ' active'
          : ''
      }`}
      onClick={onSelectConvo}
    >
      {convo.name ||
      remainingUsers.map(({ firstName, id }, idx) => (
        <span
          key={id}
          className={`chatting-user-name ${
            idx === remainingUsers.length - 1
              ? 'last'
              : ''
          }`}
        >
          {firstName}
        </span>
      ))}
    </div>
  );
}
