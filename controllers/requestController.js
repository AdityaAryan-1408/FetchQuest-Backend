const Request = require('../models/Request');
const User = require('../models/User');
const { decrypt } = require('../utils/crypto');


const createRequest = async (req, res) => {
    try {
        const { itemsList, estimatedCost, tip, deliveryLocation } = req.body;
        if (!itemsList || !estimatedCost || !tip || !deliveryLocation) {
            return res.status(400).json({
                msg: 'Please provide all values'
            });
        }
        req.body.requesterId = req.user.userId;
        const request = await Request.create(req.body);
        await User.findByIdAndUpdate(req.user.userId, { $inc: { requestsMade: 1 } });
        res.status(201).json({ request });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Server Error'
        });
    }
}

const getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find({ status: 'open' })
            .populate('requesterId', 'name averageRating profilePictureUrl')
            .sort({ createdAt: -1 });

        res.status(200).json({ requests, count: requests.length });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Server Error'
        });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;
        const { userId: runnerId } = req.user;
        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({
                msg: `No request with id: ${requestId}`
            });
        }

        if (request.status !== 'open') {
            return res.status(400).json({
                msg: 'This request has already been accepted'
            });
        }

        if (request.requesterId.toString() === runnerId) {
            return res.status(400).json({
                msg: 'You cannot accept your own request'
            });
        }

        request.status = 'accepted';
        request.runnerId = runnerId;
        await request.save();
        res.status(200).json({ msg: 'Request accepted successfully!', request });


    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Server Error'
        })
    }
};

const deleteRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;
        const { userId } = req.user;

        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({ msg: `No request with id: ${requestId}` });
        }

        if (request.requesterId.toString() !== userId) {
            return res.status(401).json({ msg: 'Not authorized to access this route' });
        }

        if (request.status !== 'open') {
            return res.status(400).json({ msg: 'Cannot delete a request that has been accepted' });
        }

        await request.deleteOne();

        res.status(200).json({ msg: 'Success! Request has been deleted.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

const rateUser = async (req, res) => {
    try {
        const { rating } = req.body;
        const { id: requestId } = req.params;
        const { userId: raterId } = req.user;

        if (typeof rating != 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ msg: 'Rating must be a number from 1 to 5' });
        }

        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ msg: `No request with id: ${requestId}` });
        }

        if (request.status !== 'completed') {
            return res.status(400).json({ msg: 'Quest must be completed before rating.' });
        }

        let userToRateId;
        if (request.requesterId.toString() === raterId) {
            userToRateId = request.runnerId;
        } else if (request.runnerId.toString() === raterId) {
            userToRateId = request.requesterId;
        } else {
            return res.status(401).json({ msg: 'Not authorized to rate this user' });
        }

        const userToRate = await User.findById(userToRateId);
        if (!userToRate) {
            return res.status(404).json({ msg: 'User to be rated not found' });
        }

        userToRate.ratings.push(rating);
        userToRate.numberOfRatings = userToRate.ratings.length;
        const totalRating = userToRate.ratings.reduce((a, b) => a + b, 0);
        userToRate.averageRating = totalRating / userToRate.numberOfRatings;
        await userToRate.save();

        res.status(200).json({ msg: 'Rating submitted successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
}

const completeRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;
        const { userId: requesterId } = req.user;

        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({ msg: `No request with id: ${requestId}` });
        }

        if (request.requesterId.toString() !== requesterId) {
            return res.status(401).json({ msg: 'Not authorized to complete this quest.' });
        }

        if (request.status !== 'accepted') {
            return res.status(400).json({ msg: 'Only an "accepted" quest can be completed.' });
        }

        request.status = 'completed';
        await request.save();

        if (request.runnerId) {
            await User.findByIdAndUpdate(request.runnerId, { $inc: { runsCompleted: 1 } });
        }

        res.status(200).json({ msg: 'Quest completed successfully!', request });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

const cancelRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;
        const { userId } = req.user;

        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({ msg: `No request with id: ${requestId}` });
        }

        const isRequester = request.requesterId.toString() === userId;
        const isRunner = request.runnerId && request.runnerId.toString() === userId;

        if (!isRequester && !isRunner) {
            return res.status(401).json({ msg: 'Not authorized to cancel this quest.' });
        }

        if (request.status !== 'accepted') {
            return res.status(400).json({ msg: 'Only an accepted quest can be canceled.' });
        }

        request.status = 'open';
        request.runnerId = null;
        await request.save();

        res.status(200).json({ msg: 'Quest canceled and returned to the live feed.', request });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const myRequests = await Request.find({ requesterId: req.user.userId })
            .populate('runnerId', 'name profilePictureUrl averageRating runsCompleted')
            .populate('requesterId', 'name profilePictureUrl averageRating')
            .sort({ createdAt: -1 });

        res.status(200).json({ requests: myRequests, count: myRequests.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

const getMyRuns = async (req, res) => {
    try {
        const myRuns = await Request.find({ runnerId: req.user.userId })
            .populate('requesterId', 'name profilePictureUrl averageRating')
            .populate('runnerId', 'name profilePictureUrl averageRating runsCompleted')
            .sort({ createdAt: -1 });

        res.status(200).json({ requests: myRuns, count: myRuns.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};


const getQuestContact = async (req, res) => {
    try {
        const { id: questId } = req.params;
        const { userId } = req.user;

        const request = await Request.findById(questId);

        if (!request) {
            return res.status(404).json({ msg: 'Quest not found.' });
        }

        // Security Check 1: Must be part of the quest
        const isRequester = request.requesterId.toString() === userId;
        const isRunner = request.runnerId && request.runnerId.toString() === userId;

        if (!isRequester && !isRunner) {
            return res.status(401).json({ msg: 'Not authorized to view this information.' });
        }

        // Security Check 2: Quest must be active
        if (request.status !== 'accepted') {
            return res.status(400).json({ msg: 'Contact info is only available for active, accepted quests.' });
        }

        // Find the *other* user
        const otherUserId = isRequester ? request.runnerId : request.requesterId;
        const otherUser = await User.findById(otherUserId);

        if (!otherUser) {
            return res.status(404).json({ msg: 'Contact user not found.' });
        }

        // Check if phone exists
        if (!otherUser.phone) {
            return res.status(404).json({ msg: 'User has not provided a phone number.' });
        }

        // Decrypt and send
        try {
            const decryptedPhone = decrypt(otherUser.phone);
            res.status(200).json({ phone: decryptedPhone });
        } catch (e) {
            console.error('Failed to decrypt phone for user:', otherUserId, e);
            return res.status(500).json({ msg: 'Could not retrieve contact info.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
};


module.exports = {
    createRequest,
    getAllRequests,
    acceptRequest,
    deleteRequest,
    rateUser,
    getMyRequests,
    getMyRuns,
    completeRequest,
    cancelRequest,
    getQuestContact,
};