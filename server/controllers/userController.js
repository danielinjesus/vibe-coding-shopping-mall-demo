const User = require('../models/User');
const jwt = require('jsonwebtoken');

const userController = {};

userController.createUser = async (req, res) => {
  try {
    const { email, name, password, user_type } = req.body;
    const user = await User.create({ email, name, password, user_type });

    // 회원가입 성공 시 자동 로그인: JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 비밀번호 제외하고 반환
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ status: 'success', data: userResponse, token });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일과 비밀번호 확인
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', error: 'Email and password are required' });
    }

    // 유저 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: 'fail', error: 'Invalid email or password' });
    }

    // 비밀번호 확인
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ status: 'fail', error: 'Invalid email or password' });
    }

    // 성공: JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 비밀번호 제외하고 유저 정보 반환
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ status: 'success', data: userResponse, token });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.getMe = async (req, res) => {
  try {
    // authMiddleware에서 설정한 userId 사용
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'fail', error: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ status: 'fail', error: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = userController;
