import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Video from 'react-native-video';
import {useDispatch, useSelector} from 'react-redux';
import PostHeader from '../Post/Header';
import FireIcons from 'react-native-vector-icons/MaterialIcons';
import {WIDTH} from '../../../../Utils/CONSTANTS';
import {COLOR, globalStyles} from '../../../Style/styles';
import {firebaseDatabase} from '../../../Firebase/Firebase';
import {
  PutVideoLikeByFilenameProps,
  UserPublicData,
} from '../../../../Types/types';
import {AuthContext} from '../../../AuthProvider/AuthProvider';
import {UserContext} from '../../../Provider/UserProvider';
import {putVideoLikeByFilename, selectVideoData} from '../../../../redux/slice';

const PostDetail = () => {
  const {user} = useContext(AuthContext);
  const {userID} = useContext(UserContext);
  const {video} = useSelector(selectVideoData);
  const [userData, setUserData] = useState<UserPublicData | null>(null);
  const [videoDimension, setVideoDimension] = React.useState({
    width: 0,
    height: 0,
  });
  const dispatch = useDispatch();

  const updateLike = async (data: PutVideoLikeByFilenameProps) => {
    try {
      await dispatch(putVideoLikeByFilename(data));
    } catch (error) {
      console.log('error updateLike', error);
    }
  };
  // {uri: video.uri}

  useEffect(() => {
    async function getUserData(id: string) {
      const idolSnapshot = await firebaseDatabase
        .ref('/users/' + id)
        .child('public')
        .once('value');

      setUserData(idolSnapshot.exportVal());
    }

    getUserData(userID);
  }, [userID]);

  return (
    <View>
      {userData !== null && <PostHeader user={userData} />}
      <Video
        style={{
          width: videoDimension.width,
          height: videoDimension.height,
        }}
        muted
        source={require('../../../../assets/videos/easy.mp4')}
        resizeMode="contain"
        controls={true}
        repeat={true}
        onLoad={(data) => {
          //   console.log('data', data);
          const scale = WIDTH / data.naturalSize.width;
          setVideoDimension((prevState) => {
            return {
              ...prevState,
              width: data.naturalSize.width * scale,
              height: data.naturalSize.height * scale,
            };
          });
        }}
      />

      <View style={styles.info}>
        <View style={styles.videoInfoBar}>
          <TouchableOpacity
            onPress={() =>
              updateLike({video: video, likeByID: user!.public.id})
            }>
            {video.likeByThisUser === true ? (
              <FireIcons
                name="local-fire-department"
                size={20}
                color="orangered"
              />
            ) : (
              <FireIcons name="local-fire-department" size={20} color="gray" />
            )}
          </TouchableOpacity>
          <Text style={styles.likeCount}>{video.likeCount}</Text>
        </View>
        <View>
          <Text>{video.timestamp}</Text>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          <Text style={globalStyles.strong}>{userData?.displayName}: </Text>
          {video.title}
        </Text>
      </View>

      <View style={styles.comments}>
        <Text>Comments:</Text>
      </View>
    </View>
  );
};

export default PostDetail;

const styles = StyleSheet.create({
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomColor: COLOR.grayColor,
    borderBottomWidth: 1,
    borderTopColor: COLOR.grayColor,
    borderTopWidth: 1,
  },
  title: {
    fontSize: 20,
  },
  info: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoInfoBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 24,
  },
  comments: {
    marginTop: 16,
    marginLeft: 4,
    borderBottomColor: COLOR.grayColor,
    borderBottomWidth: 1,
  },
});
